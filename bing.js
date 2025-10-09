// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.342
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
var default_search_words = ["古树情缘", "钱塘江现震撼月亮潮", "老外成青甘大环线“显眼包”", "中国航天 生日快乐", "寻亲25年的千万富翁儿子将办婚礼", "苏超4强出炉 苏北五虎全军覆没", "以色列哈马斯签首阶段协议", "重庆女子乘“黄色法拉利”去内蒙古", "中产迷上“打铁” 有人花费上10万", "男子假期上高速被收费 真相哭笑不得", "男子时速105公里撞上横穿高速野猪群", "贵州金沙路边有老虎出没系谣言", "千万粉丝网红离婚 曾被赞神仙眷侣", "48岁渔村网红阿霞坠海遇难", "美国驻华大使馆：没钱了 停更", "小狐狸：如你所愿 手机我叼走了", "美股收盘：标普纳指再创历史新高", "轿车下坡突然“起飞”：最高离地4米", "女子点88元菜品结账变358元", "中国驻英国大使馆连发4条答问", "主人来找国庆“被弃高速”的小狗了", "国庆假期 世界第一高桥火了", "全固态金属锂电池 中国有重要突破", "日本特别警报：或现数十年一遇大灾害", "蜜雪冰城小票藏连载小说", "有人提前错峰返程 10公里开了50分钟", "高位截瘫女孩攀爬55小时登顶泰山", "游客在老虎山“旱地拔葱”美翻天", "主人称狗狗下地掰玉米掰了三年了", "2名中国游客在马来西亚失联细节披露", "青海老虎沟遇难徒步者来自中国台湾", "年轻情侣忘情接吻险从扶梯摔下", "王者荣耀崩了", "“民告官” 湖北一市市长出庭应诉", "司机称阳光晃眼误踩油门车辆飞起", "俄三防部队司令遇袭身亡案调查结束", "杭州出现99元假期“短托养老”", "游客景区玩滑梯时 有蛇“从天而降”", "中国近半年没买过美国一粒大豆", "64岁港星林俊贤在景区“打工”", "大学生国庆8天假掰了7天半玉米", "中国游客海外失联 疑似二人照片曝光", "观光车压碎老虎下巴？动物园回应", "下一次见面就是春节了", "男子发现浴巾有血迹 酒店质疑敲诈", "成都四年级女生斩获两项国际冠军", "美国务卿偷偷给特朗普递纸条", "牛弹琴：留给马克龙的时间不多了", "以色列总理将召集内阁批准停火协议", "以色列现役战机均来自美国", "嘎玛沟最后一批徒步游客抵达曲当镇"]

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
