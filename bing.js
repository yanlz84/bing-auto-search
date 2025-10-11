// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.347
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
var default_search_words = ["巩固团结奋斗的思想基础", "世界冠军因盗窃被捕 还将被禁赛90天", "12306回应乘客坐高铁自备椅凳", "两个万亿度 折射经济增长新动能", "山航空姐全面换穿平底鞋", "有人全家中招！这种病毒进入流行期", "净网：网警斩断侵公黑色产业链", "驴友爬山捡到毒蛇后轮流抚摸", "知名经济学家：美国遏制不了中国", "孟凡利任广东省代省长", "爸爸带多动症儿子从湖南徒步去山东", "四川达州大竹县发生洪灾系谣言", "A股又现“天价离婚” 涉34亿元股份", "夫妻长“复制粘贴脸”走红 专家解读", "西安一小区发现唐宰相张九龄夫人墓", "乱套了！北方冷到破纪录 南方38℃", "28元保健品被吹成“神药”卖72000元", "起底台军“心战大队”", "丽江市长李刚主动投案 接受调查", "英伟达市值一夜蒸发超1.6万亿元", "秦昊让中医把脉被告知“阳气不足”", "美第一夫人：我与普京直接联系几个月", "全球最大固体火箭再出征", "中国自主研发北斗探空系统 打破垄断", "微信最新公告：一批违规微短剧下架", "婴儿12克金手镯被偷已找回 嫌犯被抓", "男子9.9元买过期饮料索赔1000元", "女子点6元饭摔伤索赔21万 法院判了", "哈马斯准备放弃在加沙地带的治理权", "梅德韦杰夫称赞朝鲜阅兵式", "官方回应建议公交老年卡高峰期禁用", "妻子曝柯文哲关到全身是病 畏惧见人", "女子在曹氏鸭脖麻辣烫中吃出壁虎", "以军空袭真主党 爆炸致天空一片橙红", "吴克群帮癌症晚期女孩办婚礼", "泰国总理下直升机时不慎被绊倒", "男子失踪7年后 家人才知他车祸离世", "歌手胡海泉加入中国作家协会", "朝鲜“最具威力”核武器亮相阅兵", "墨西哥终止对中国风塔征收反倾销税", "最新预警！多地迎大暴雨、雷暴大风", "“无论何时何地 河南烩面都在”", "人民网评谈车企黑公关 小米高管回应", "全国铁路今起实行新列车运行图", "国乒抵达印度 选手挤大巴回酒店", "NBA主席萧华：杨瀚森有前途", "朝鲜阅兵式女兵舞剑气场拉满", "中国气象预警系统“妈祖”应用多国", "国产天龙三号对标SpaceX猎鹰9号", "朝鲜阅兵高清大图来了", "“国之重器”华龙一号有新进展"]

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
