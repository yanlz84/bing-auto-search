// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.360
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
var default_search_words = ["让百姓过上好日子 总书记惦念在心", "男孩自查文献确诊罕见卟啉病", "沪上阿姨推出子宫形玩偶引争议", "拔节生长 中国制造锻造更强筋骨", "泽连斯基穿上正装 特朗普：我很喜欢", "男子上下班途中把桥洞反光板擦干净", "多名男女在草原上跳起“纸片舞”", "网红“柴怼怼”被正式逮捕", "70岁大爷把跳楼机坐成摇摇椅", "印尼国防部长激动宣布要买中国歼10C", "网约车司机中途赶客 乘客秒懂下车", "新疆于田有30万亩荒地出租系谣言", "500平房子装20余台空调19个马桶", "男子回酒店发现猴子端庄坐床上", "特朗普对进口中型和重型卡车收25%税", "小S复工亮相金钟奖 给大S献歌", "小S：姐你不在的人生真的很辛苦", "演员克拉拉离婚", "成都部分青旅拒接30+女士40+男士", "俄军新重磅炸弹首次对乌实战", "金钟奖缅怀大S", "女子酒驾撞劳斯莱斯：我是国企员工", "新加坡大哥40多年来头次看雪太激动", "牛弹琴：泽连斯基又被特朗普戏弄了", "搜救人员讲述失联女童被发现细节", "全国剧烈降温 北方局地降温超15℃", "洱海网红“歪脖子树”疑被人为砍断", "丈夫中1000万变心离婚案将择期再审", "长颈鹿头被卡石堆里 脖子歪成90度", "英国安德鲁王子放弃王室头衔", "辽宁一幼儿园被指15天虐童上千次", "小S让妈妈把奖杯和大S照片放一起", "国内咖啡机销量激增75.6%", "宿舍直播泛滥 谁来守护隐私边界", "一家三口被撞身亡案家属透露新细节", "小伙带村里老人拍“夕阳红版三国”", "特朗普称目前不打算供乌战斧导弹", "本科生不写论文能毕业不意味着放水", "泽连斯基与特朗普谈了什么？一文速览", "今年第24号台风“风神”已生成", "女子网购快递被标：挑剔顾客二次换货", "北方多地降温降到“发紫”", "东北人囤秋菜名场面", "对野人小孩事件的追问岂是多管闲事", "外交部回应俄新社记者遇袭身亡", "揭秘福建舰的隐藏硬核实力", "继承人名字写错了自书遗嘱还有效吗", "毕加索名画送展途中失踪 警方追查", "联合国副秘书长进入加沙地带", "垃圾车向渭河倾倒垃圾 清运人员被拘", "以军袭击加沙城一辆汽车 多人伤亡"]

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
