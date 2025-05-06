// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.30
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
var default_search_words = ["中俄友谊故事世代流传", "中国首位！赵心童斯诺克世锦赛夺冠", "丁俊辉祝贺赵心童夺冠", "再上19天班又放假了", "男子出海打捞上来的生蚝带商品标签", "“短剧女王”道歉", "赵心童邀请女朋友上台", "女演员贵州拍戏遇极端天气 胳膊受伤", "张国清：调查翻船事故 依法追责", "关税带来的不确定性才是最昂贵的", "女儿去世后妈妈遇见了帮过她的叔叔", "桂林象鼻山景区分时段计费？假", "不出口美国了 上海市民疯狂“捡漏”", "赵心童夺冠刷爆多项纪录", "印度不让“一滴水”进入巴基斯坦", "95后在海底捞办婚礼 餐费仅花2万多", "印巴紧张对峙下 巴基斯坦再“亮剑”", "中台协连发视频祝贺赵心童夺冠", "弟弟冒领瘫痪哥哥58万工伤金买豪车", "贵州游船侧翻事发时出现14级阵风", "日本一地出现神秘地鸣", "山大齐鲁医院称论文存在学术不端", "《蛮好的人生》大结局太癫了", "秘鲁总统：在矿工遇害地区实施宵禁", "华晨宇演唱会炒饭免费 粉丝吃了3吨", "贵州游船倾覆事故70人还在医院救治", "陈建斌蒋勤勤带儿子逛环球影城", "中金：A股节后有望迎来“开门红”", "云南一尾矿坍塌致5人被埋", "赵心童：我感觉我像在做梦", "印度军方宣布成功测试一款新型水雷", "OpenAI重组计划被迫改变", "贝佐斯支持的核聚变公司称资金紧张", "俄军击落6架企图攻击莫斯科的无人机", "37岁赵丽颖染粉发美出圈", "美国原油期货收跌约2%", "小伙在莫斯科红场高举国旗唱国歌", "纽约期金涨超3% 重返3340美元", "长安汽车前4个月销量89.58万辆", "女婿晒丈母娘准备的170斤土特产", "王晶曝刘德华感情史：做刘太太很辛苦", "赵心童说今晚要喝一杯", "高速堵车源头竟是司机在睡觉", "津门虎门将闫炳良今年2次出场丢6球", "女儿嫌弃妈妈包的饺子不好看", "中国是时候和特朗普谈关税了吗", "孙红雷连发三条祝贺赵心童", "以色列本-古里安机场运营恢复", "巴西3月石油产量达362.1万桶/日", "牛弹琴：好莱坞被吓懵了", "张凌赫给迪丽热巴把脉"]

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
