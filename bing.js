// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.412
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["中西关系如何“跨越山海”", "两部门：不允许城镇居民到农村买农房", "大场面！机器狗扛枪冲锋", "“十五五”规划《纲要》问计求策", "情绪消费火了", "“大湾鸡”癫出圈 内胆是10后小孩哥", "净网：网民散布买卖儿童器官谣言被罚", "教育部等七部门发文 事关每个孩子", "世界最大高空风力发电捕风伞开伞", "影视飓风CEO在相亲角被大妈吐槽", "“大叔不理解但照做”走红 本人回应", "涉退役军人违法违规账号被处置", "离婚证背面有“囍”字", "特朗普致信以总统求赦免内塔尼亚胡", "男子开车叼牙线被罚 交管复核后撤销", "马云妻子花1.8亿买下伦敦豪宅", "温度超65℃ 塑料盒会释放有害物质", "成都飞三亚票价飙至6000元", "山西“狗咬人引发的血案”今日开庭", "多名老人组团开电动轮椅上高速", "GPT-5.1发布 OpenAI开始拼情商", "失火的永庆寺是南朝四百八十寺之一", "日本资深议员称高市早苗极为危险", "公安部将限制汽车百公里加速小于5秒", "涉案金额超27亿元！佘智江被引渡回国", "男子鱼刺卡喉后身亡工伤诉求遭驳回", "孙杨抢跳犯规被取消成绩", "“大湾鸡”书包火了 二手最高卖1988", "北京北部出现极光", "黑龙江大兴安岭上演极光美景", "樊振东撞脸“大湾鸡”", "小区电梯广告扰民 谁有权关了它", "邻居称被儿子殴打老人有4个女儿", "遛狗未拴绳惊倒路人 饲养人赔28万", "武契奇：欧洲正准备与俄罗斯打仗", "正直播NBA：奇才vs火箭", "证券日报：炒作股票名称不可取", "美航母穿“缉毒”马甲 大家照样认识", "多名富豪被控在波黑战争射杀平民", "内蒙古呼伦贝尔夜空现绚丽极光", "“搞事”早苗还会走多远", "万亿级央企成立新公司", "张展硕200自再夺冠！潘展乐第三", "未来三天我国北方多地可见极光", "一起追更“地表最难乒乓球赛”", "外国机构投资者进一步增持中国股票", "航母压境 美为打击委内瑞拉做准备", "中国团队攻克有机发光晶体管难题", "乌克兰曝战时腐败窝案 两部长下台", "胡歌出演广告片被指抄袭 品牌回应", "29岁女子失踪一周 上月刚生完孩子"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
